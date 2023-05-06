import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading/LoadingPage";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/Loading/LoadingSpinner";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithAuthor) => {
  const { post, author } = props;
  return (
    <div className="flex gap-4 border-b border-pink-400 p-4">
      <Image
        src={author.profileImageUrl}
        className="h-14 w-14 rounded-full"
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col text-pink-400">
        <p className="flex gap-1">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`• ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
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
    <>
      <Head>
        <title>T3 app tutorial</title>
        <meta name="description" content="T3 app tutorial" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center">
        <div className="flex h-full w-full flex-col border-x-2 border-pink-400 md:max-w-2xl">
          <div className="flex w-full border-b border-pink-400 p-4">
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
                  className="w-full rounded-lg bg-transparent py-2 outline-none placeholder:text-pink-200"
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
                  <button onClick={() => mutate({ content: input })}>
                    Post
                  </button>
                )}
                {isPosting && <LoadingSpinner size={20} />}
              </div>
            )}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
