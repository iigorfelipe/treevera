/**
 * try/catch para chamadas do Supabase.
 *
 * - Se a chamada falhar: retorna [null, Error]
 * - Se der certo: retorna [response, null]
 *
 * OBS: O `response` é retornado inteiro (não só `data`),
 * pois Supabase varia o shape de retorno dependendo do método.
 *
 * Motivo:
 * O Supabase tem diferentes formatos de retorno para cada método
 * (por exemplo, signInWithOAuth, from().select(), insert(), etc.) e
 * algumas funções lançam erros, outras retornam objetos com `error`.
 *
 * Essa função padroniza o tratamento de erros, evitando try/catch repetidos
 * em todo lugar. Assim você sempre obtém um tuple [response, error] e pode
 * lidar de forma consistente com sucesso ou falha.
 */
export const safeSupabase = async <
  T extends { error?: E | null },
  E extends { message?: string } = { message?: string },
>(
  promise: Promise<T>,
): Promise<[T | null, Error | null]> => {
  try {
    const response = await promise;

    if (response.error) {
      const err =
        response.error instanceof Error
          ? response.error
          : new Error(response.error.message || "Erro desconhecido");
      return [null, err];
    }

    return [response, null];
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return [null, error];
  }
};
