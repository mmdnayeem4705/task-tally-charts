import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UserWithIncompleteTasks {
  email: string;
  incompleteCount: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-daily-reminder function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    console.log(`Checking for incomplete tasks on ${today}`);

    // Get all users from auth
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    console.log(`Found ${users.users.length} total users`);

    const usersToNotify: UserWithIncompleteTasks[] = [];

    for (const user of users.users) {
      if (!user.email) continue;

      // Get user's tasks
      const { data: userTasks, error: tasksError } = await supabaseAdmin
        .from("user_tasks")
        .select("task_id")
        .eq("user_id", user.id);

      if (tasksError) {
        console.error(`Error fetching tasks for user ${user.id}:`, tasksError);
        continue;
      }

      if (!userTasks || userTasks.length === 0) {
        console.log(`User ${user.email} has no tasks configured`);
        continue;
      }

      // Get today's completed records for this user
      const { data: todayRecords, error: recordsError } = await supabaseAdmin
        .from("daily_records")
        .select("task_id, completed")
        .eq("user_id", user.id)
        .eq("date", today);

      if (recordsError) {
        console.error(`Error fetching records for user ${user.id}:`, recordsError);
        continue;
      }

      // Check if all tasks are completed
      const completedTaskIds = new Set(
        (todayRecords || [])
          .filter(r => r.completed)
          .map(r => r.task_id)
      );

      const incompleteTasks = userTasks.filter(
        t => !completedTaskIds.has(t.task_id)
      );

      if (incompleteTasks.length > 0) {
        usersToNotify.push({
          email: user.email,
          incompleteCount: incompleteTasks.length,
        });
        console.log(`User ${user.email} has ${incompleteTasks.length} incomplete tasks`);
      } else {
        console.log(`User ${user.email} has completed all tasks`);
      }
    }

    console.log(`Sending reminders to ${usersToNotify.length} users`);

    // Send emails to users with incomplete tasks
    const emailResults = [];
    for (const userInfo of usersToNotify) {
      try {
        const emailResponse = await resend.emails.send({
          from: "Task Tally <onboarding@resend.dev>",
          to: [userInfo.email],
          subject: "⏰ Daily Task Reminder - Don't forget to update your status!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Daily Task Reminder</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi there! 👋</p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  You have <strong style="color: #ef4444;">${userInfo.incompleteCount} task${userInfo.incompleteCount > 1 ? 's' : ''}</strong> that ${userInfo.incompleteCount > 1 ? 'haven\'t' : 'hasn\'t'} been updated today.
                </p>
                <p style="font-size: 16px; margin-bottom: 25px;">
                  Take a moment to log your progress and keep your streak going! 🔥
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://task-tally-charts.lovable.app" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                    Update My Tasks
                  </a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
                  Keep up the great work! Every day counts. 💪
                </p>
              </div>
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
                You're receiving this because you have incomplete tasks for today.<br>
                Task Tally - Track Your Daily Progress
              </p>
            </body>
            </html>
          `,
        });

        console.log(`Email sent to ${userInfo.email}:`, emailResponse);
        emailResults.push({ email: userInfo.email, success: true, response: emailResponse });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${userInfo.email}:`, emailError);
        emailResults.push({ email: userInfo.email, success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        usersChecked: users.users.length,
        remindersSent: usersToNotify.length,
        results: emailResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
