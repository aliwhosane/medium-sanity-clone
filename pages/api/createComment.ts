import type { NextApiRequest, NextApiResponse } from "next";
import sanityClient from "@sanity/client";

type Data = {
    name: string;
    email: string;
    comment: string;
    _id: string;
}

const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
    useCdn: process.env.NEXT_PUBLIC_NODE_ENV === "production",
}

const client = sanityClient(config);

export default async function createComment(req: NextApiRequest, res: NextApiResponse) {
    const { name, email, comment, _id } = req.body;
    const data: Data = {
        name,
        email,
        comment,
        _id,
    };

    try {
        await client.create({
            _type:'comment',
            post: {
                _type: 'reference',
                _ref: _id,
            },
            name,
            email,
            comment,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'There was an error' });
    }

    res.status(200).json({message: "Comment submitted, wait for approval"});
}