import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import typescript from '@rollup/plugin-typescript'; // Bỏ comment nếu cần transformer
import transformer from '@libmedia/cheap/build/transformer'; // Bỏ comment nếu cần transformer

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@libmedia/avplayer/dist/esm/[0-9]*.avplayer.js',
          dest: './', // Sao chép vào thư mục gốc của thư mục build (thường là 'dist')
        },
        
      ],
    }),
   // Bỏ comment phần này nếu bạn gặp vấn đề với const enum hoặc cần các tính năng nâng cao của libmedia
    typescript({
      tsconfig: './tsconfig.json', // Đảm bảo đường dẫn này đúng
      transformers: {
        before: [
          {
            type: 'program',
            factory: (program) => {
              return transformer.before(program);
            },
          },
        ],
      },
      // Quan trọng: plugin typescript này có thể ghi đè trình biên dịch esbuild mặc định của Vite cho TS.
      // Bạn có thể cần cấu hình cẩn thận các tùy chọn 'include'/'exclude'
      // để chỉ xử lý các tệp yêu cầu transformer.
      // Tham khảo hướng dẫn "Quick Start" của libmedia để biết thiết lập chính xác.
    }), 
     ],
  server: {
    allowedHosts: ['player.bandia.vn']
     //headers: {
  //     'Cross-Origin-Opener-Policy': 'same-origin',
  //     'Cross-Origin-Embedder-Policy': 'require-corp',
  //   },
  // },
  // worker: { // Nếu sử dụng các tính năng đa luồng của libmedia
  //   plugins: () => [
  //     typescript({
  //       tsconfig: './tsconfig.json', // Hoặc một tsconfig cụ thể cho worker
  //       transformers: {
  //         before: [
  //           {
  //             type: 'program',
  //             factory: (program) => {
  //               return transformer.before(program);
  //             }
  //           }
  //         ]
  //       }
  //     })
  //   ]
  }
})
