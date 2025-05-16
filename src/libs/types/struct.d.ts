import Stats from "@libmedia/avpipeline/struct/stats";
import { AVFrameRef } from "@libmedia/avutil/struct/avframe";
import { AVPacketRef } from "@libmedia/avutil/struct/avpacket";
import List from "@libmedia/cheap/std/collection/List";
import { Mutex } from "@libmedia/cheap/thread/mutex";
export declare class AVPlayerGlobalData {
    avpacketList: List<pointer<AVPacketRef>>;
    avframeList: List<pointer<AVFrameRef>>;
    avpacketListMutex: Mutex;
    avframeListMutex: Mutex;
    stats: Stats;
}
