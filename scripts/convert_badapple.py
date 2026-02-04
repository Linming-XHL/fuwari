from PIL import Image
import json
import os

ASCII_CHARS = '@%#*+=-:. '

def resize_image(image, new_width=120):
    width, height = image.size
    ratio = height / width
    new_height = int(new_width * ratio * 0.45)  # 调整比例系数，使字符画比例更接近原始视频
    return image.resize((new_width, new_height))

def grayify(image):
    return image.convert('L')

def pixels_to_ascii(image):
    pixels = image.getdata()
    ascii_str = ''
    for pixel in pixels:
        ascii_str += ASCII_CHARS[pixel // 32]
    return ascii_str

def convert_image_to_ascii(image_path, width=120):
    try:
        image = Image.open(image_path)
        image = resize_image(image, width)
        image = grayify(image)
        ascii_str = pixels_to_ascii(image)
        ascii_img = '\n'.join([ascii_str[i:(i + width)] for i in range(0, len(ascii_str), width)])
        return ascii_img
    except Exception as e:
        print(f"Error converting {image_path}: {e}")
        return None

def process_badapple_frames(source_dir, output_file):
    frames = []
    total_frames = 6574
    
    print(f"Processing {total_frames} frames from {source_dir}...")
    
    for i in range(1, total_frames + 1):
        frame_num = str(i).zfill(4)
        image_path = os.path.join(source_dir, f'BadApple{frame_num}.jpg')
        
        if os.path.exists(image_path):
            ascii_frame = convert_image_to_ascii(image_path, width=120)
            if ascii_frame:
                frames.append(ascii_frame)
                if i % 100 == 0:
                    print(f"Processed {i}/{total_frames} frames")
        else:
            print(f"Warning: {image_path} not found")
    
    print(f"Total frames processed: {len(frames)}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(frames, f, ensure_ascii=False)
    
    print(f"Saved character art data to {output_file}")

if __name__ == '__main__':
    source_directory = r'E:\TaskmgrPlayer\BadApple'
    output_json = r'D:\Blog\public\badapple\frames.json'
    
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    
    process_badapple_frames(source_directory, output_json)
