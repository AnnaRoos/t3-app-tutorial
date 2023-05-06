import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading/LoadingPage";

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
        <p>{post.content}</p>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <div />;

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Failed to load posts</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
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
                  type="text"
                  placeholder="Type some emojis"
                  className="w-full rounded-lg bg-transparent py-2 outline-none"
                />
              </div>
            )}
          </div>
          {data.map(({ post, author }) => (
            <PostView key={post.id} post={post} author={author} />
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
