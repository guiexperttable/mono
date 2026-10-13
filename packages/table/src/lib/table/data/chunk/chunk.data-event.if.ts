import {RequestChunkIf} from "./request-chunk.if";


/** @category Utilities */
export interface ChunkDataIf<T> extends RequestChunkIf {

  rows: T[];

}