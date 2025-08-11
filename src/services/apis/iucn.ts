// import type { StatusCode } from "@/components/vulnerability-badge";

// const IUCN_BASE_v3 = "https://apiv3.iucnredlist.org/api/v3";
// const IUCN_BASE_v4 = "https://apiv4.iucnredlist.org/api/v4";
// const IUCN_BASE_v4 = "https://apiv4.iucn.org/api/v4";

// export async function getSpeciesIUCN(scientificName: string) {
//   const url = `${IUCN_BASE_v4}/taxa/scientific_name/${encodeURIComponent(scientificName)}`;
//   const token = import.meta.env.VITE_IUCN_TOKEN;

//   try {
//     const response = await fetch(url, {
//       headers: {
//         Authorization: `Token ${token}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Erro na requisição: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Erro ao buscar dados da espécie:", error);
//     throw error;
//   }
// }
