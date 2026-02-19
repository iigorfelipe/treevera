import { Badge } from "@/common/components/ui/badge";
import { userProgress } from "@/common/utils/data-profile-fake";

export const UserProgress = () => {
  return (
    <div className="space-y-3">
      <h2 className="border-b">PROGRESSO</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Espécies exploradas</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.totalSpecies}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Desafios completados</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.challenges}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Precisão de acerto</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.accuracy}%
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Medalhas conquistadas</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.medals}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Sequência de dias</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            {userProgress.streak}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Ranking global</span>

          <Badge className="text-primary text-md flex items-start border bg-transparent outline-1">
            #{userProgress.rank}
          </Badge>
        </div>
      </div>
    </div>
  );
};
