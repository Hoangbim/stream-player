import { useEffect, useRef, useState } from "react";
import AVPlayer from "./libs/esm/avplayer.js";
import "./App.css";

// Các biến cấu hình cho AVPlayer
const defaultConfig = {
  wsUrl: "wss://video.bandia.vn/live", // URL luồng WSS mặc định
  enableSimd: false,
  useMse: true,
  enableHardwareAcceleration: true,
  enableWebCodecs: true,
  enableWebGPU: false,
  enableWorker: true,
};

function App() {
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<AVPlayer | null>(null);
  const videoUrl = "wss://video.bandia.vn/live"; // URL luồng WSS của bạn

  // State để lưu trữ cấu hình player
  const [config, setConfig] = useState(defaultConfig);
  const [isPlaying, setIsPlaying] = useState(false);

  // Hàm xử lý thay đổi cấu hình
  const handleConfigChange = (key: string, value: boolean | string) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  // Hàm để khởi động hoặc dừng player
  const togglePlayback = async () => {
    if (!isPlaying) {
      await initializeAndPlay();
      setIsPlaying(true);
    } else {
      if (playerRef.current) {
        await playerRef.current.pause();
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const initializeAndPlay = async () => {
    if (playerContainerRef.current && !playerRef.current) {
      console.log("Đang khởi tạo AVPlayer...");
      try {
        const player = new AVPlayer({
          container: playerContainerRef.current,
          isLive: true,
          getWasm: (type, codecId, mediaType) => {
            const baseUrl = "https://video.bandia.vn/static/dist";
            const enableSimd = config.enableSimd;
            const supportAtomic = true; // Hoặc kiểm tra như trong avplayer.html
            const defaultVersion = supportAtomic ? "-atomic" : "";

            console.log(
              `Yêu cầu WASM: type=${type}, codecId=${codecId}, mediaType=${mediaType}`
            );

            try {
              switch (type) {
                case "decoder": {
                  if (codecId === undefined) {
                    console.error(
                      `Yêu cầu WASM decoder nhưng codecId không xác định.`
                    );
                    throw new Error(`CodecId không xác định cho WASM decoder.`);
                  }

                  let wasmPath = "";
                  if (codecId >= 65536 && codecId <= 65572) {
                    wasmPath = `/decode/pcm${
                      enableSimd ? "-simd" : defaultVersion
                    }.wasm`;
                  } else {
                    switch (codecId) {
                      case 2:
                        wasmPath = `/decode/mpeg2video${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 12:
                        wasmPath = `/decode/mpeg4${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 27:
                        wasmPath = `/decode/h264${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 30:
                        wasmPath = `/decode/theora${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 139:
                        wasmPath = `/decode/vp8${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 167:
                        wasmPath = `/decode/vp9${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 173:
                        wasmPath = `/decode/hevc${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 196:
                        wasmPath = `/decode/vvc${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 225:
                        wasmPath = `/decode/av1${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86017:
                        wasmPath = `/decode/mp3${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86018:
                        wasmPath = `/decode/aac${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86019:
                        wasmPath = `/decode/ac3${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86020:
                        wasmPath = `/decode/dca${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86021:
                        wasmPath = `/decode/vorbis${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86028:
                        wasmPath = `/decode/flac${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86051:
                        wasmPath = `/decode/speex${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86056:
                        wasmPath = `/decode/eac3${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      case 86076:
                        wasmPath = `/decode/opus${
                          enableSimd ? "-simd" : defaultVersion
                        }.wasm`;
                        break;
                      default:
                        console.error(
                          `Codec giải mã không được hỗ trợ hoặc chưa được cấu hình: ${codecId}`
                        );
                        throw new Error(
                          `Không tìm thấy WASM decoder cho codecId: ${codecId}`
                        );
                    }
                  }
                  return baseUrl + wasmPath;
                }
                case "resampler":
                  return (
                    baseUrl +
                    `/resample/resample${
                      enableSimd ? "-simd" : defaultVersion
                    }.wasm`
                  );
                case "stretchpitcher":
                  return (
                    baseUrl +
                    `/stretchpitch/stretchpitch${
                      enableSimd ? "-simd" : defaultVersion
                    }.wasm`
                  );
                default:
                  console.error(`Loại WASM không được hỗ trợ: ${type}`);
                  throw new Error(`Không tìm thấy WASM cho loại: ${type}`);
              }
            } catch (error) {
              console.error("Lỗi khi xác định đường dẫn WASM:", error);
              throw error;
            }
          },

          checkUseMES: (_streams) => {
            return config.useMse;
          },
          enableHardware: config.enableHardwareAcceleration,
          enableWebCodecs: config.enableWebCodecs,
          enableWebGPU: config.enableWebGPU,
          enableWorker: config.enableWorker,
          jitterBufferMax: 0.1,
          jitterBufferMin: 0.1,
          lowLatency: true,
        });

        playerRef.current = player;

        // Lắng nghe các sự kiện (tùy chọn, để debug hoặc cập nhật UI)
        player.on("error", (err: any) => {
          console.error("Lỗi AVPlayer:", err);
        });
        player.on("playing", () => {
          console.log("AVPlayer: Bắt đầu phát.");
        });
        player.on("ended", () => {
          console.log("AVPlayer: Kết thúc phát.");
          setIsPlaying(false);
        });
        player.on("loadeddata", () => {
          console.log("AVPlayer: Đã tải dữ liệu.");
        });

        console.log(`Đang thử tải video từ: ${videoUrl}`);
        await player.load(config.wsUrl);
        console.log("AVPlayer: Video đã tải, đang thử phát.");
        await player.play();
        console.log("AVPlayer: Lệnh phát đã được gửi.");
      } catch (error) {
        console.error("Không thể khởi tạo hoặc phát AVPlayer:", error);
        setIsPlaying(false);
      }
    }
  };

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        console.log("Đang hủy instance AVPlayer.");
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="app-container">
        <h1>Av Player</h1>

        <div className="config-panel">
          <h2>Config</h2>
          <div className="config-options">
            <div className="config-item">
              <label>
                <input
                  // defaultValue={config.wsUrl || 'wss://video.bandia.vn/live'}
                  type="text"
                  value={config.wsUrl}
                  onChange={(e) => handleConfigChange("wsUrl", e.target.value)}
                />
                Ws URL
              </label>
            </div>
            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.enableSimd}
                  onChange={(e) =>
                    handleConfigChange("enableSimd", e.target.checked)
                  }
                />
                Enable SIMD
              </label>
            </div>

            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.useMse}
                  onChange={(e) =>
                    handleConfigChange("useMse", e.target.checked)
                  }
                />
                Use MSE
              </label>
            </div>

            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.enableHardwareAcceleration}
                  onChange={(e) =>
                    handleConfigChange(
                      "enableHardwareAcceleration",
                      e.target.checked
                    )
                  }
                />
                Enable Hardware Acceleration
              </label>
            </div>

            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.enableWebCodecs}
                  onChange={(e) =>
                    handleConfigChange("enableWebCodecs", e.target.checked)
                  }
                />
                Enable WebCodecs
              </label>
            </div>

            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.enableWebGPU}
                  onChange={(e) =>
                    handleConfigChange("enableWebGPU", e.target.checked)
                  }
                />
                Enable WebGPU
              </label>
            </div>

            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.enableWorker}
                  onChange={(e) =>
                    handleConfigChange("enableWorker", e.target.checked)
                  }
                />
                Enable Worker
              </label>
            </div>
          </div>

          <button className="play-button" onClick={togglePlayback}>
            {isPlaying ? "Stop" : "Play"}
          </button>
        </div>

        <div ref={playerContainerRef} className="player-wrapper">
          {/* AVPlayer sẽ render nội dung vào đây */}
        </div>

        <div className="info">
          <p>
            Đang cố gắng phát luồng từ: <code>{videoUrl}</code>
          </p>
          <p>Kiểm tra console của trình duyệt để xem log và lỗi từ AVPlayer.</p>
        </div>
      </div>
    </>
  );
}

export default App;
