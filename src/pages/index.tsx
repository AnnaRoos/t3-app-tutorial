import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading/LoadingPage";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/Loading/LoadingSpinner";
import Layout from "./layout";
import { PostView } from "~/components/Posts/PostView";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Failed to load posts</div>;

  return (
    <>
      {data.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </>
  );
};

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  api.posts.getAll.useQuery();
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: async () => {
      setInput("");
      await ctx.posts.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors?.content;
      if (!!errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post");
      }
    },
  });

  if (!userLoaded) return <div />;

  return (
    <Layout>
      <div className="flex w-full border-b border-teal-400 p-4">
        {!isSignedIn && <SignInButton />}
        {!!isSignedIn && (
          <div className="flex w-full items-center gap-4 ">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-14 h-14",
                },
              }}
            />
            <input
              value={input}
              type="text"
              placeholder="Type some emojis"
              className="w-full rounded-lg bg-transparent py-2 outline-none placeholder:text-teal-200"
              onChange={(e) => setInput(e.target.value)}
              disabled={isPosting}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (input !== "" && !isPosting) {
                    mutate({ content: input });
                  }
                }
              }}
            />
            {input !== "" && !isPosting && (
              <button onClick={() => mutate({ content: input })}>Post</button>
            )}
            {isPosting && <LoadingSpinner size={20} />}
          </div>
        )}
      </div>
      <Feed />
    </Layout>
  );
};

export default Home;
