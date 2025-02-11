import json
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


app = FastAPI()
# app .mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
class Sorter:
    def __init__(self, file_path):
        # инициализируем файлы
        
        self.file_path = file_path
        self.data = None

    # чтение файла
    def read(self):
        try:
            # открываем с помощью with так как он имеет ряд важных примуществ в моем проекте
            with open(self.file_path, "r") as f:
                self.data = json.load(f)
                if not isinstance(self.data, list):
                    # проверяем на то есть ли в файле список, соответственно
                    # если нет то выводим Формат файла не соответствует ожидаемому
                    raise ValueError("Формат файла не соответствует ожидаемому")
        except FileNotFoundError:
            # проверка на то найден ли файл
            print("Файл не найден")
        except ValueError as e:
            # проверка на расчеты и математические ошибки то-есть на правильное чтение файла
            print("Ошибка при чтении файла:", e)

    # сортировка
    def sort(self, field, reverse=False):
        # если в файле данных нет, то вызывает метод read()
        if self.data is None:
            # вызывает метод read()
            self.read()
        try:
            self.data = [item for item in self.data if isinstance(item, dict)]
            # проверяем на, то являеться ли анные
            self.data = sorted(self.data, key=lambda x: x[field], reverse=reverse)
            # используя сортируем по полям указанным пользователем
        except KeyError:
            # если указанное поле не найдено выводиться "Данное поле", field, "не найдено... :("
            print("Данное поле", field, "не найдено... :(")

    # записываем данные сортировки обратно в файл
    def write(self):
        try:
            with open(self.file_path, "w") as f:
                json.dump(self.data, f)
        except IOError as e:
            print("Возникла ошибка при записи файла:", e)

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