import type { NextPage } from "next";
import Head from "next/head";
import Header from "../components/Header";
import Banner from "../components/Banner";
import { sanityClient, urlFor } from "../sanity";
import { Post } from "../typing";
import Posts from "../components/Posts";
interface Props {
  posts: Post[];
}

const Home = ({ posts }: Props) => {
  return (
    <div>
      <Head>
        <title>MEDIUM CLONE</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Banner />
      <Posts posts={posts} />
    </div>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const query = `*[_type == "post"]{
    _id,
    title,
    author -> {
      name,
      image
    },
    description,
    mainImage,
    slug
  }`;

  const posts = await sanityClient.fetch(query);

  return {
    props: {
      posts,
    },
  };
};
