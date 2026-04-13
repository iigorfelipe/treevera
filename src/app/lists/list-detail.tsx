import { useParams } from "@tanstack/react-router";
import { ListDetail } from "@/modules/lists/list-detail";
import { useDocumentTitle } from "@/hooks/use-document-title";

export const ListDetailPageRoute = () => {
  const { username, listSlug } = useParams({ strict: false }) as {
    username: string;
    listSlug: string;
  };
  useDocumentTitle(listSlug?.replace(/-/g, " "));
  return <ListDetail username={username} listSlug={listSlug} />;
};
