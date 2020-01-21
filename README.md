# Яндекс ШРИ. Задание 3. Поиск и исправление ошибок


## Ход работы

### Устраняем проблемы при запуске

Для начала я попробовал запустить проект при помощи клавиши **F5** чтобы посмотреть как будет работать приложение.
При первом запуске я получил несколько ошибок в консоль VSCode. Обе относились к файлу server.ts.
Открыв файл я увидел, что в его основе лежит зависимость под названием **vscode-languageserver**. Я бегло посмотрел выдачу в поисковике об этой штуке. Насколько я понял это некий набор средств, который помогает подружить язык на котором хочется писать с IDE в которой хочется работать. Под языком в данном случае подразумевается BEMJSON? Посмотрим.
Расширение представлено сервером и клиентом. Клиент - это видимо наш плагин для VSCode, который обращается к серверу, который будет помогать в работе нашего плагина.

Далее я начал по немногу читать документацию по Language Server и обратил внимание, что все начинается с файла extension.ts. Его я и решил изучить, попутно исправляя всякие стилистические ошибки, будь то пропущенная точка с запятой или лишняя неиспользумая переменная.

В ходе чтения extension.ts наткнулся на ошибку в openPreview функции: сокращенная if конструкция без фигурных скобок и после этого сразу же идет else. Не уверен, если честно, в том, что такой код будет нерабочим, но как минимум выглядит странно. Лучше исправить чтобы не забыть.
Также, в той же функции внутри if else конструкции повторно объявляется константа panel. В таком случае можно объявить выше panel как let и потом записать в нее же создание нового panel если его еще нет.

Хм ну ладно. В extension.ts похоже происходит что-то вроде настройки клиента, т.е. плагина для VSCode. Определены всякие функции для работы панели с превью и тд. К этому еще вернемся. Тогда можно взяться за server.ts и разобраться что же там за ошибки. Как обычно попутно исправляя всякие стилистические косяки.

Первая проблема, которую подчеркнула красным IDE при попытке запуска проекта: это ошибка в возвращаемом значении в коллбэке, который передается в conn.onInitialize. Параметр capabilities.textDocumentSync принимает на вход либо число, либо нечто с типом TextDocumentSyncOptions. Глянув на примеры настройки сервера в интернете, я увидел, что обычно туда передают syncKind свойство из экземпляра класса TextDocuments. По описанию похож на тот самый "always", который там стоял ранее. Попробуем поставить его.

Вторая проблема была в функции validateTextDocument. Там что-то не то передается в параметр location, который используется для того, чтобы показать где в JSON-е ошибка. Похоже в AstIdentifier такого значения нет, хотя вспоминая прошлое задание, в json-to-ast такое поле было вроде как у каждой сущности. Проверим, может забыли что в интерфейсе указать. Да, так и есть, в интерфейсе это поле пропустили. Ну ничего, добавим.

Ну похоже проект наконец-то завелся. Попробуем взять какой-нибудь BEMJSON из первого задания и посмотрит как будет работать расширение.

### Исправляем работу превью панели

Кажется, что пока ничего толком не работает. Вместо превью отображается какая-то строка {{content}}, а линтер как будто ничего не подчеркивает. Будем разбираться.

Поиск строки {{content}} по проекту выдал index.html. Там эта строка лежит в файле index.html. Видимо этот index.html как раз и рисуется в панели. Похоже в этот аргумент должна прокидываться верстка. Если не ошибаюсь, для этих целей испольузется БЭМ шаблонизатор, bem-xjst если точнее. Насколько помню он импортировался в extension.ts. Посмотрим как там у него дела.

И правда, в файле extenstion.ts используется beb-xjst, а точнее движок bemhtml для того чтобы по входному json-у отрендерить строку с html разметкой. В данном случае, наверное, лучше всего будет продебажить файл extension.ts и посмотреть что там как происходит когда я открываю превью.

Расставил точки останова на старте, где читается index.html файл и в функции updateContent, которая отвечает за генерацию разметки и обновление view панели. Похоже, что все хорошо вплоть до момента когда производится попытка заменить в дефолтном view (наш index.html) аргумента {{content}} на сгенерированную по JSON-у разметку. Регулярка, по которой происходит замена, предполагает пробельные отступы между фигурными скобками и словом внутри. Пожалуй, заменим + на * чтобы вариант как у нас тоже матчился с этой регуляркой.

Теперь все в порядке. Наш BEMJSON преобразуется в верстку и та вставляется в превью панель. Правда она теперь абсолютно пустая. Вероятно стилей нет. По-хорошему, нужно уже тащить стили, которые я написал в рамках первого задания, но сейчас думаю проблема не в этом. Видимо они просто не подключаются.

В проекте в папке preview лежит файл style.css. В нем какие-то странные селекторы .div. С точки начинается селектор по классу, поэтому уберем ее пока, чтобы стили навесились на все div-ы.

Так, ну проблема не только в этом. Дебажить в этом случае код уже не очень удобно. Хорошо бы иметь какие-нибудь devtools для этой панели, чтобы посмотреть, что там внутри вообще.
Оказывается такая возможность есть! Команда **Developer: Open Webview Developer Tools** позволяет открыть devtools для webview которым и является наша панель.
Открыв devtools я увидел, что в консоли разработчика падает ошибка, мол не могу загрузить стили по такому пути. В index.html используется относительный путь к файлу со стилями, но выше есть интересные тег <base> который позволяет установить базовый путь для всех относительных путей. В итоге я заметил, что в начале пути стоит какое-то странное слово 'resource:'. Честно говоря я пока плохо понимаю зачем оно нужно, но погуглив некоторое время я выяснил, что это значение не совсем корректное. Для корректной установки базового пути для vscode среды (или как-то так) нужно указать значение 'vscode-resource'.
Сам по себе путь, который прокидывается в base формируется с помощью функции getMediaPath. Там и указывается параметр 'resource'. Поменяв его на нужно значение, я наконец-то увидел превью моего BEMJSON-а. Осталось только положить свои стили вместо дефолтных.

Стили положил. Все завелось без проблем, теперь в превью можно увидеть красивую страничку. Круто!

### Тестируем работу превью панели

 Превью панель в целом починили. Теперь, пожалуй, стоит пройтись по критериям работы этой панели чтобы убедиться, что все действительно работает как надо. Итак, пойдем по порядку:
 1) Превью интерфейса доступно для всех файлов `.json`.

 Тут похоже все хорошо. Проверил на другом JSON-е, который не является BEMJSON-ом. Все вроде хорошо, правда превью пустое, ну оно и понятно.
 Если в файл с расширением JSON положить простую строку, то VSCode ругается, мол это не валидный JSON. Наверняка так и надо.

 2) Превью открывается в отдельной вкладке.

Через команду `Example: Show preview` превью действительно открывается корректно. Похоже тут все хорошо.
Через кнопку справа вверху я уже пробовал открывать, так что тут тоже все в порядке.
По горячим клавишам тоже все ок. Эти сочетания настраиваются в package.json и они совпадают с тем, что описано в критерии. Вряд ли тут могут быть проблемы.

3) Вкладка превью должна открываться рядом с текущим редактором.

Да вроде все так и есть. Попробовал потыкать по-разному, проблем похоже нет.

4) Если превью уже открыто, то должна открываться уже открытая вкладка, новая открываться не должна.

Попробовал открывать вкладку разными способами. Кейса когда открылось бы несколько вкладок не заметил.

5) Когда пользователь изменяет в редакторе структуру блоков, превью должно обновляться.

Удалял туда сюда всякие блоки, пробовал редактировать их названия. Результат сразу же отображается в превью.

6) Сейчас превью отображает структуру блоков в виде прямоугольников. Реализуйте отображение превью с помощью вёрстки и JS из первого задания.

Ну а это я уже добавил.

### Исправляем работу линтера

Итак, линтер. Чтобы его запустить, нужно открыть настройки и включить его, потому что по дефолту он отключен.
Хм. После включения ничего не изменилось. Я попробовал нарушить правило про верхний регистр, но не вижу никакой реакции редактора.

За запуск линтера отвечает server.ts. Расставив несколько точек останова я пришел к выводу, что сервер как будто не запускается вообще. Нужно почитать Getting Started статьи о том, как с ним вообще нужно работать в этом случае.

Нет. Он все-таки запускается, просто чтобы его дебажить, нужно выполнить некоторые дополнительные манипуляции. В файле launch.json нужно дописать дополнительную секцию чтобы дебаг сервера стал возможным. Поскольку чтобы запустить процесс отладки сервера нужен запущенный клиент, то добавим еще одну секцию, которая описывает комбинацию запуска клиента и сервера.

И вот похоже проблема найдена. Функция makeLint() принимает на вход JSON строку, а вместо этого ей передается путь к JSON-у, который мы редактируем. Все из-за того, что константе JSON мы присваиваем значение uri документа вместо его содержимого. Посмотрев в режиме отладки на этот объект я заметил метод getText(). Похоже можно попробовать использовать его чтобы получить нужный нам JSON. Это получается на каждый введенный символ будет прогоняться линтинг всего документа? Как-то жестко.

Теперь парсинг JSON-а в AST происходит корректно и даже работает функция прохода, правда на выходе ошибок никаких нет, хотя должны быть.

Как оказалось проблема крылась в файле linter.ts. При проходе через AST в функцию walk передается два callback-а, которые запускают валидацию и записывают результат (массив ошибок) в массив errors, который затем вернет линтер. Для записи полученных при валидации ошибок используется функция concat, но она не изменяет массив, а возвращает новый. Вместо concat здесь можно использовать простой push и тогда все станет как надо.

Действительно теперь линтер реагирует на невалидный JSON и выдает список ошибок. Правда есть проблема: он не реагирует на команды типа Ctrl-Z.

Еще одна небольшая отладка позволила выяснить, что на самом деле сервер регистрирует изменения документа даже через Ctrl-Z. Проблема в том, что по окончанию работы линтера и обработки его результатов, должен получиться массив diagnostics со всеми проблемами JSON-а, а затем он будет отправлен в редактор при помощи функции sendDiagnostics(). Только вот отправка происходит только в том случае, когда массив не пустой. Думаю, следует избавиться от этой проверки на длину массива и выполнять эту команду всегда. 

Да, похоже теперь все работает как надо. Теперь настало время добавить в проект собственный линтер, разработанный в рамках второго задания.
К сожалению, мой линтер не прошел все автотесты при сдаче, но он прошел большую их часть. Так что думаю, его можно без проблем использовать здесь. Может при помощи редактора будет проще понять, где же я допустил ошибки.

### Прочесываем код на наличие стилистических ошибок

Как оказалось, в tsconfig.json есть секция закомментированных правил. Пожалуй, лучше их включить. Помогут найти неиспользуемые переменные и прочие проблемы.

## Задание

**Дан исходный код приложения, в котором есть ошибки. Одни ошибки — стилистические, а другие не позволят даже запустить приложение. Вам нужно найти все ошибки и исправить их.**

Тестовое приложение — это плагин VS Code для удобного прототипирования интерфейсов с помощью дизайн-системы из первого задания. Вы можете описать в файле `.json` блоки, из которых состоит интерфейс. Плагин добавляет превью (1) и линтер (2) для структуры блоков.

![скриншот интерфейса](extension.png)

### Превью интерфейса

- Превью интерфейса доступно для всех файлов `.json`.
- Превью открывается в отдельной вкладке:
  - при выполнении команды `Example: Show preview` через палитру команд;
  - при нажатии кнопки сверху от редактора (см. скриншот);
  - при нажатии горячих клавиш **⌘⇧V** (для macOS) или **Ctrl+Shift+V** (для Windows).
- Вкладка превью должна открываться рядом с текущим редактором.
- Если превью уже открыто, то должна открываться уже открытая вкладка, новая открываться не должна.
- Когда пользователь изменяет в редакторе структуру блоков, превью должно обновляться
- Сейчас превью отображает структуру блоков в виде прямоугольников. Реализуйте отображение превью с помощью вёрстки и JS из первого задания.

### Линтер структуры блоков

- Линтер применяется для всех файлов `.json`.
- Линтер подсвечивает ошибочное место в файле и отображает сообщение при наведении мыши.
- Линтер отображает сообщения на панели `Problems` (**⌘⇧M** для macOS или **Ctrl+Shift+M** для Windows), сообщения группируются по файлам, при клике происходит переход к ошибочному месту.
- Сейчас плагин использует линтер-заглушку, проверяющий всего два правила: 1) «запрещены названия полей в верхнем регистре»; 2) «в каждом объекте должно быть поле `block`». Подключите в проект линтер из второго задания.

### Настройки

Плагин добавляет в настройки VS Code новый раздел `Example` с параметрами:

- `example.enable` — использовать линтер;
- `example.severity.uppercaseNamesIsForbidden` — тип сообщения для правила «Запрещены названия полей в верхнем регистре»;
- `example.severity.blockNameIsRequired` — тип сообщения для правила «В каждом объекте должно быть поле `block`».

Типы сообщений: `Error`, `Warning`, `Information`, `Hint`.

При изменении конфигурации новые настройки должны применяться к работе линтера.

## Как запустить

1. Открыть проект в VS Code.
2. Запустить `npm i`.
3. Нажать **F5**.

Должно открыться ещё одно окно VS Code с подключённым плагином.
