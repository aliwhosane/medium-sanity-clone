export interface Post {
    _id: string,
    title: string,
    _createAt: string,
    author: {
        name: string,
        image: string
    },
    desciption: string,
    mainImage: {
        asset: {
            url: string
        }
    },
    slug: {
        current: string
    },
    body: [object]
}