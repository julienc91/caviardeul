export const getNextArticleCountdown = () => {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const diff = tomorrow.getTime() - now.getTime();
  return Math.round(diff / 1000);
};
