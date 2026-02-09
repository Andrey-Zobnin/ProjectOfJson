"""
Создание простой иконки для приложения
Требует: pip install pillow
"""
try:
    from PIL import Image, ImageDraw, ImageFont
    
    # Создаём изображение 256x256
    size = 256
    img = Image.new('RGBA', (size, size), (99, 102, 241, 255))  # Фиолетовый фон
    draw = ImageDraw.Draw(img)
    
    # Рисуем белый круг
    margin = 30
    draw.ellipse([margin, margin, size-margin, size-margin], fill=(255, 255, 255, 255))
    
    # Рисуем текст "DS"
    try:
        font = ImageFont.truetype("arial.ttf", 100)
    except:
        font = ImageFont.load_default()
    
    text = "DS"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - 10
    
    draw.text((x, y), text, fill=(99, 102, 241, 255), font=font)
    
    # Сохраняем в разных размерах для ICO
    img.save('icon.png')
    
    # Создаём ICO файл
    img_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
    img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_48 = img.resize((48, 48), Image.Resampling.LANCZOS)
    img_256 = img
    
    img_256.save('icon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (256, 256)])
    
    print("✅ Иконка создана: icon.ico и icon.png")
    
except ImportError:
    print("❌ Установите Pillow: pip install pillow")
except Exception as e:
    print(f"❌ Ошибка: {e}")
