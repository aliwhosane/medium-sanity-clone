import { GetStaticProps } from "next";
import React from "react";
import Header from "../../components/Header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typing";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";
import { spawn } from "child_process";

interface Props {
  post: Post;
}

interface IFormInputs {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function DetailedPost({ post }: Props) {
  const [sumbitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>();

  const onSub: SubmitHandler<IFormInputs> = async (data) => {
    fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log("Comment created");
        setSubmitted(true);
      })
      .catch((err) => {
        console.error(err);
        setSubmitted(false);
      });
  };
  return (
    <div>
      <Header />
      <img
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />
      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">
          {post.desciption}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="font-extralight text-xs text-gray-500">
            Blog post by{" "}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-10">
          <PortableText
            className=""
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="text-xl font-light my-5" {...props} />
              ),
              li: (props: any) => <li className="ml-4 list-disc" {...props} />,
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-600">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />
      {sumbitted ? (
        <h1 className="px-10 text-lg py-5 bg-yellow-300 text-white mx-auto">
          Your comment has been submitted & will be shown once approved!
        </h1>
      ) : (
        <form className="flex flex-col p-5 max-w-2xl mx-auto mb-10">
          <h3 className="text-sm text-yellow-500">Enjoyed the article?</h3>
          <h4 className="text-3xl font-bold ">Leave a comment below</h4>
          <hr className="py-3 mt-2" />
          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />
          <label className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              {...register("name", { required: true })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring-0"
              placeholder="Jhon Doe"
              type="text"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", { required: true })}
              className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring-0"
              placeholder="Jhon@Doe.com"
              type="email"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", { required: true })}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring-0"
              placeholder="Whatever  you want to say"
              rows={0}
            />
          </label>
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-300">The name field is required</span>
            )}
            {errors.email && (
              <span className="text-red-300">The Email field is required</span>
            )}
            {errors.comment && (
              <span className="text-red-300">
                The comment field is required
              </span>
            )}
          </div>
          <input
            type="submit"
            className="shadow bg-yellow-500 hover:bg-yellow-400 focus:outline-none text-white font-bold py-2 px-4 rounded"
            onSubmit={handleSubmit(onSub)}
          />
        </form>
      )}
    </div>
  );
}

export default DetailedPost;

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
    _id,
    slug {
        current
    }    
    }`;

  const posts = await sanityClient.fetch(query);
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == "${params?.slug}"][0]{
        _id,
        _createdAt,
        title,
        author -> {
        name,
        image
        },
        'comments':  *[ _type == "comment" && post._ref ==  ^.id && approved == trye],
        description,
        mainImage,
        slug,
        body
    }`;

  const post = await sanityClient.fetch(query);

  if (!post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      post,
    },
    revalidate: 15,
  };
};
