import { useAuth } from "./useAuth";

// Admin email ro'yxati (o'zingizning emailingizni qo'shing)
const ADMIN_EMAILS = [
  "shohjahondilmurodov56@gmail.com", // sizning emailingiz
  // boshqa adminlar
];

export const useAdmin = () => {
  const { user } = useAuth();
  const isAdmin = user ? ADMIN_EMAILS.includes(user.email || "") : false;

  return { isAdmin, user };
};
