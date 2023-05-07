import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Layout from "../layout";
import { PostView } from "~/components/Posts/PostView";
import { ssgHelper } from "~/server/helpers/ssgHelper";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getPostById.useQuery({ id });

  if (!data || !data.post) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <Layout>
        <PostView post={data.post} author={data.author} />
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = ssgHelper();
  const id = context.params?.id;
  if (typeof id !== "string") {
    throw new Error("no id");
  }

  await ssg.posts.getPostById.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" }; // 'blocking' | 'true' | 'false
};

export default SinglePostPage;
