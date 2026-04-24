#!/bin/bash

# PWA 图标生成脚本
SOURCE_IMAGE="/Users/hanying/Desktop/赤兔github/2/public/img/original.png"
OUTPUT_DIR="/Users/hanying/Desktop/赤兔github/2/public/img"

echo "🖼️  开始生成PWA应用图标..."
echo "源图片: $SOURCE_IMAGE"
echo "输出目录: $OUTPUT_DIR"
echo ""

# 需要生成的图标尺寸
sizes=(
  "192:icon-192.png"
  "512:icon-512.png"
  "180:apple-touch-icon.png"
)

# 生成各种尺寸的图标
for size_spec in "${sizes[@]}"; do
  size=${size_spec%%:*}
  filename=${size_spec##*:}
  output_path="$OUTPUT_DIR/$filename"
  
  echo "✓ 生成 $filename ($size x $size)..."
  sips -z $size $size "$SOURCE_IMAGE" --out "$output_path"
  
  if [ $? -eq 0 ]; then
    echo "  ✅ 成功: $output_path"
  else
    echo "  ❌ 失败: $output_path"
  fi
done

# 生成 Maskable 图标（需要处理背景）
echo ""
echo "⚙️  生成自适应图标（maskable）..."

# 对于maskable图标，使用相同的图像即可
cp "$OUTPUT_DIR/icon-192.png" "$OUTPUT_DIR/icon-192-maskable.png"
cp "$OUTPUT_DIR/icon-512.png" "$OUTPUT_DIR/icon-512-maskable.png"

echo "  ✅ Maskable 图标已创建"

# 生成截图
echo ""
echo "📸 生成应用截图..."

# 移动端截图 (540x720)
echo "✓ 生成移动端截图 (540x720)..."
sips -z 720 540 "$SOURCE_IMAGE" --out "$OUTPUT_DIR/screenshot-1.png"
if [ $? -eq 0 ]; then
  echo "  ✅ 成功: $OUTPUT_DIR/screenshot-1.png"
fi

# 桌面端截图 (1280x720)
echo "✓ 生成桌面端截图 (1280x720)..."
sips -z 720 1280 "$SOURCE_IMAGE" --out "$OUTPUT_DIR/screenshot-2.png"
if [ $? -eq 0 ]; then
  echo "  ✅ 成功: $OUTPUT_DIR/screenshot-2.png"
fi

echo ""
echo "✅ 所有图标已生成完成！"
echo ""
ls -lh "$OUTPUT_DIR"/*.png
