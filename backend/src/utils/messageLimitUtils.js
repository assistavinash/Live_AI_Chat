/**
 * Checks if a user needs a daily reset and performs it if necessary.
 * Returns the current count and whether limit is reached.
 */
async function checkAndResetDailyLimit(user) {
  const now = new Date();
  const lastReset = new Date(user.lastMessageReset);

  // Check if 24 hours have passed since last reset
  const timeDifference = now - lastReset;
  const hoursElapsed = timeDifference / (1000 * 60 * 60);

  let updatedUser = user;

  if (hoursElapsed >= 24) {
    // Reset the counter
    updatedUser = await user.constructor.findByIdAndUpdate(
      user._id,
      {
        dailyMessageCount: 0,
        lastMessageReset: now
      },
      { new: true }
    );
  }

  return {
    user: updatedUser,
    currentCount: updatedUser.dailyMessageCount,
    limit: updatedUser.dailyMessageLimit,
    isLimitReached: updatedUser.dailyMessageCount >= updatedUser.dailyMessageLimit,
    lastResetTime: updatedUser.lastMessageReset,
    timeUntilReset: calculateTimeUntilReset(updatedUser.lastMessageReset)
  };
}

/**
 * Increments the message count for a user
 */
async function incrementMessageCount(user) {
  const updatedUser = await user.constructor.findByIdAndUpdate(
    user._id,
    { $inc: { dailyMessageCount: 1 } },
    { new: true }
  );

  return updatedUser.dailyMessageCount;
}

/**
 * Calculate the next reset time (24 hours from last reset)
 */
function calculateTimeUntilReset(lastResetTime) {
  const lastReset = new Date(lastResetTime);
  const nextReset = new Date(lastReset.getTime() + (24 * 60 * 60 * 1000));
  return nextReset;
}

/**
 * Format time to readable local format (e.g., "07:30 PM")
 */
function formatTimeToReadable(date) {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Get friendly message about when user can chat again
 */
function getResetMessage(nextResetTime) {
  const formattedTime = formatTimeToReadable(nextResetTime);
  return {
    title: "You've reached today's message limit.",
    message: `Please try again after ${formattedTime}.`,
    formattedTime
  };
}

module.exports = {
  checkAndResetDailyLimit,
  incrementMessageCount,
  calculateTimeUntilReset,
  formatTimeToReadable,
  getResetMessage
};
