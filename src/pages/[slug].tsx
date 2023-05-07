import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { Layout } from "./layout";
import Image from "next/image";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data || !data.username) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <Layout>
        <div className="relative h-36 bg-teal-600">
          <Image
            src={data.profileImageUrl}
            width={128}
            height={128}
            alt={`@${data.username}'s profile picture`}
            className="absolute bottom-0 left-0 -mb-16 ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="border-b border-teal-400 px-4 pb-4 pt-16 text-2xl font-bold">{`@${data.username}`}</div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
  const slug = context.params?.slug;
  if (typeof slug !== "string") {
    throw new Error("slug is not a string");
  }
  const username = slug.replace("@", "");
  await ssg.profile.getUserByUsername.prefetch({ username });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" }; // 'blocking' | 'true' | 'false
};

export default ProfilePage;
