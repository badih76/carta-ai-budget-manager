export interface IAPIResponse {
  status: number,
  data: any,
  message: string,
  error: string | null
}