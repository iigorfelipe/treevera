import { useParams } from "@tanstack/react-router";
import { ListDetail } from "@/modules/lists/list-detail";

export const ListDetailPageRoute = () => {
  const { username, listSlug } = useParams({ strict: false }) as {
    username: string;
    listSlug: string;
  };
  return <ListDetail username={username} listSlug={listSlug} />;
};
