/** Metro turns these into asset ids; TypeScript needs telling. */
declare module '*.m4a' {
  const asset: number;
  export default asset;
}
declare module '*.mp3' {
  const asset: number;
  export default asset;
}
