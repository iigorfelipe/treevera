import { useParams } from "@tanstack/react-router";
import { ListDetail } from "@/modules/lists/list-detail";

export const ListDetailPageRoute = () => {
  const { listId } = useParams({ strict: false }) as { listId: string };
  return <ListDetail listId={listId} />;
};
