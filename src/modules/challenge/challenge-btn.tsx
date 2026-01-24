import { Image } from "@/common/components/image";
import Alvo from "@/assets/alvo.gif";

export const ChallengeBtn = () => {
  // const [challenge, setChallenge] = useAtom(treeAtom.challenge);

  // const isDaily = useMemo(() => challenge.mode === "DAILY", [challenge.mode]);

  // const handleCkick = useCallback(() => {
  //   setChallenge((prev) => ({
  //     ...prev,
  //     mode: !isDaily ? "DAILY" : "RANDOM",
  //     status: "IN_PROGRESS",
  //   }));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isDaily]);

  return (
    <div className="group flex items-center font-semibold">
      <Image src={Alvo} className="size-12" alt="Alvo gif" />

      <div className="flex flex-col items-start">
        <h2 className="text-xl font-bold 2xl:text-2xl">
          {/* Desafio {isDaily ? "Diário" : "Aleatório"} */}
          Desafio Diário
        </h2>
        <p>
          Encontre:{" "}
          <i className="font-semibold text-emerald-600 dark:text-green-500">
            Homo sapiens
          </i>
        </p>
      </div>
    </div>
  );
};
