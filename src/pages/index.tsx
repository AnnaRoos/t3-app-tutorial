import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading/LoadingPage";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/Loading/LoadingSpinner";
import Link from "next/link";
import { Layout } from "./layout";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithAuthor) => {
  const { post, author } = props;
  return (
    <div className="flex gap-4 border-b border-teal-400 p-4">
      <Image
        src={author.profileImageUrl}
        className="h-14 w-14 rounded-full"
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col text-teal-400">
        <p className="flex gap-1">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{`• ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </p>
        <p className="text-2xl">{post.content}</p>
      </div>
    </div>
  );
};

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
