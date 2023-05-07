import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithAuthor) => {
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
