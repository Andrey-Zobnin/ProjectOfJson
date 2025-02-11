# main.py
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import logging

# set log
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Jinja2
templates = Jinja2Templates(directory="templates")

class Sorter:
    def __init__(self, file_path):
        self.file_path = file_path
        self.data = None

    def read(self):
        try:
            with open(self.file_path, "r") as f:
                self.data = json.load(f)
                if not isinstance(self.data, list):
                    raise ValueError("Формат файла не соответствует ожидаемому. Ожидается список.")
            logging.info("Файл успешно прочитан.")
        except FileNotFoundError:
            logging.error("Файл не найден.")
        except json.JSONDecodeError:
            logging.error("Ошибка декодирования JSON. Файл поврежден или имеет неверный формат.")
        except ValueError as e:
            logging.error(f"Ошибка при чтении файла: {e}")

    def sort(self, field, reverse=False):
        if self.data is None:
            self.read()

        if not self.data:
            logging.warning("Нет данных для сортировки.")
            return

        try:
            self.data = [item for item in self.data if isinstance(item, dict)]
            self.data = sorted(self.data, key=lambda x: x.get(field), reverse=reverse)
            logging.info(f"Данные успешно отсортированы по полю '{field}'.")
        except KeyError:
            logging.error(f"Поле '{field}' не найдено в данных.")
        except TypeError as e:
            logging.error(f"Ошибка при сортировке: {e}")

    def write(self):
        try:
            with open(self.file_path, "w") as f:
                json.dump(self.data, f, indent=4)
            logging.info("Данные успешно записаны в файл.")
        except IOError as e:
            logging.error(f"Ошибка при записи файла: {e}")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/sort")
async def sort_data(request: Request, file_path: str = Form(...), sort_field: str = Form(...), reverse_sort: str = Form("no")):
    sorter = Sorter(file_path)
    sorter.read()
    sorter.sort(sort_field, reverse=reverse_sort.lower() == "yes")
    sorter.write()
    return RedirectResponse(url="/", status_code=303)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)