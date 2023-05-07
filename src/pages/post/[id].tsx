import { type NextPage } from "next";
import Head from "next/head";
import { Layout } from "../layout";

const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <Layout>Post</Layout>
    </>
  );
};

export default SinglePostPage;
