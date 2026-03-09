import Notification from "../models/Notification.js";

class NotificationService {
  // Create a new notification
  async create(userId, notificationData) {
    try {
      const notification = await Notification.create({
        user: userId,
        ...notificationData,
        read: false,
      });
      return notification;
    } catch (error) {
      console.error("Create notification error:", error);
      return null;
    }
  }

  // Interview created
  async interviewCreated(userId, interviewId, role) {
    return this.create(userId, {
      type: "interview_created",
      title: "🎯 Interview Started",
      message: `You've started a new ${role} interview. Good luck!`,
      data: { interviewId, role },
    });
  }

  // Interview completed
  async interviewCompleted(userId, interviewId, role) {
    return this.create(userId, {
      type: "interview_completed",
      title: "✅ Interview Completed",
      message: `Great job! You've completed the ${role} interview.`,
      data: { interviewId, role },
    });
  }

  // Evaluation ready
  async evaluationReady(userId, interviewId, role, score) {
    return this.create(userId, {
      type: "evaluation_ready",
      title: "📊 Results Ready!",
      message: `Your ${role} interview results are ready. You scored ${score}/10.`,
      data: { interviewId, role, score },
    });
  }

  // Achievement unlocked
  async achievementUnlocked(userId, achievement) {
    return this.create(userId, {
      type: "achievement",
      title: "🏆 Achievement Unlocked!",
      message: achievement.message,
      data: { achievement: achievement.name },
    });
  }

  // Practice reminder
  async practiceReminder(userId, daysSinceLast) {
    return this.create(userId, {
      type: "reminder",
      title: "⏰ Time to Practice!",
      message: `You haven't practiced in ${daysSinceLast} days. Keep improving!`,
      data: { daysSinceLast },
    });
  }

  // Milestone reached
  async milestoneReached(userId, milestone, score) {
    return this.create(userId, {
      type: "milestone",
      title: "📈 New Milestone!",
      message:
        milestone.message || `You've reached a new personal best: ${score}/10!`,
      data: { milestone: milestone.name, score },
    });
  }
}

export default new NotificationService();
