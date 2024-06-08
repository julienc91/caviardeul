import { redirect } from "next/navigation";

const Page = ({ searchParams }: { searchParams: { user?: string } }) => {
  const userId = searchParams?.user ?? "";
  if (userId.length === 0) {
    redirect("/");
  } else {
    redirect(`/api/login?user=${userId}`);
  }
};

export default Page;
