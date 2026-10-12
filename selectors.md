# CSS Selectors & XPath Practice

## Part 1. Basic CSS Selectors

### 1. User Email

CSS selector:

`#shub3`

Number of matches is 1

### 2. Password

CSS selector:

`#pass`

Number of matches is 1

### 3. Submit button

CSS selector:

`button[value="Submit"]`

The locator identifies the button uniquely.

### 4. Car dropdown

CSS selector:

`select[name="cars"]`

The selector targets the <select> element specifically, not a neighboring element.

### 5. Все Company inputs

CSS selector:

`input[name="company"]`

count > 1
A selector based on a common class or attribute may match multiple elements on the page, making it less specific and potentially selecting the wrong element.

## Part 2. XPath Basics

### 6. User Email

XPath:

`//input[@id='shub3']`
`//input[@name='email' and @type='email']`

Comparison:

Both XPath expressions uniquely identify the User Email input.
The simple XPath uses the unique id attribute and is shorter and easier to read.
The structured XPath uses two attributes (name and type), making the locator more descriptive and less dependent on a single attribute.

### 7. Password

XPath:

`//input[@name='Password' and @type='password']`

### 8. Submit button

XPath:

`//button[text()='Submit']`

### 9. Element by text

XPath:

`//label[contains(., 'Can you enter name here through automation')]`

`//text()[contains(., 'Can you enter name here through automation')]`

Yes, a text-based XPath can be used to find this content.
Using `//label[contains(., 'Can you enter name here through automation')]` finds the `<label>` container,
while using `//text()[contains(., 'Can you enter name here through automation')]` finds the text node itself.

## Part 3. Repeated Elements

### 10. Company field

CSS selector `div.element-companyId input[name="company"]`;
XPath `//div[@class='element-companyId']//input[@name='company']`;
Количество совпадений: 1 (среди видимых интерактивных полей).

Как вы убедились, что выбрали именно нужный Company field?
Я проверила локатор в DevTools и убедилась, что он соответствует только одному элементу.
Также я изучила окружающую структуру DOM, чтобы удостовериться, что выбранное поле «Компания»
относится к нужному контейнеру, а не является одним из других полей «Компания» на странице.

## Part 4. User Table

### 11. Найти John Smith

XPath `//tr[.//td[contains(normalize-space(.), 'John Smith')]]`
Количество совпадений: 1

### 12. Найти роль John Smith

XPath `//tr[.//td//a[normalize-space(.)='John.Smith']]//td//a/ancestor::td/following-sibling::td[1]`

### 13. Найти статус John Smith

XPath `//tr[.//td//a[normalize-space(.)='John.Smith']]//td//a[normalize-space(.)='John.Smith']/ancestor::td/following-sibling::td[3]`

### 14. Найти пользователя по Username

XPath

Базовый locator
`//tr[.//td//a[normalize-space(.)='Garry.White']]`

А внутри найденной строки:
`./td[4]` → Employee Name
`./td[3]` → User Role
`./td[5]` → Status

## Part 5. CSS vs XPath

### 15. Один элемент — два способа

Element: Employee Name Garry White

CSS:

`tr:has(td a[href*="Garry.White"]) td:nth-child(4)`

XPath:

`//tr[.//td//a[normalize-space(.)='Garry.White']]/td[4]`

Какой вариант вы бы выбрали для automation и почему?
Здесь я выбираю XPath именно потому, что таблица требует связать один элемент с другим через DOM.

## Part 6. Find the Best Locator

| Element                 | Locator 1                                                   | Locator 2                                                                                                                              | Preferred                                            | Why?                                                                                                                      |
| ----------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **User Email**          | CSS: `#userId`                                              | CSS: `input[name="email"][type="email"]`                                                                                               | `#userId`                                            | The unique `id` is short, readable, and directly identifies the field.                                                    |
| **Submit**              | CSS: `button[value="Submit"]`                               | XPath: `//button[normalize-space(.)='Submit']`                                                                                         | `button[value="Submit"]`                             | It targets the button by its element type and specific `value` attribute. It does not depend on visible text formatting.  |
| **John Smith**          | XPath: `//td[normalize-space(.)='John Smith']`              | XPath: `//tr[.//td[normalize-space(.)='John Smith']]//td[normalize-space(.)='John Smith']`                                             | `//td[normalize-space(.)='John Smith']`              | It directly identifies the cell containing `John Smith`. It is short and readable.                                        |
| **John Smith — row**    | XPath: `//tr[.//td[normalize-space(.)='John Smith']]`       | XPath: `//tr[.//td//a[normalize-space(.)='John.Smith']]`                                                                               | `//tr[.//td[normalize-space(.)='John Smith']]`       | It clearly selects the `<tr>` containing John Smith and does not depend on the column position.                           |
| **John Smith — status** | XPath: `//tr[.//td[normalize-space(.)='John Smith']]/td[5]` | XPath: `//tr[.//td//a[normalize-space(.)='John.Smith']]//td//a[normalize-space(.)='John.Smith']/ancestor::td/following-sibling::td[3]` | `//tr[.//td[normalize-space(.)='John Smith']]/td[5]` | It first finds John Smith's row and then selects the Status cell inside that row, avoiding a global search for `Enabled`. |

## Part 7. XPath Axes

### 21. Связь label → input

XPath:

`//label[normalize-space(.)='User Email']/following::input[@name='email'][1]`

### 22. От строки к ячейке

John Smith
→ User Role

XPath:

`//tr[.//td[normalize-space(.)='John Smith']]/td[3]`

John Smith
→ Status

XPath:

`//tr[.//td[normalize-space(.)='John Smith']]/td[5]`

## Part 8. Проверка XPath

### 23. Разберите XPath

`//input[@title='Search']`
valid

`//label[normalize-space()='User Email']//following:input[@id='userId']`
invalid
Ось following записана неправильно.
После неё должны использоваться два двоеточия: following::.
`//label[normalize-space()='User Email']/following::input[@id='userId']`

`//a[normalise-space()="Why testRigor?"]`
invalid
Неверно указано название функции. В XPath используется normalize-space(),
а не normalise-space().
`//a[normalize-space()='Why testRigor?']`

`//input[@id='pass']div`
invalid
После ] нельзя сразу писать div. Между элементами должен быть / или //.
`//input[@id='pass']/div`

`//input[@id='pass']/div/`
invalid
Последний / указывает на начало следующего шага, но после него ничего нет.
`//input[@id='pass']/div`

`//label[ends-with(text(),'User Email')]`
invalid
Функция ends-with() не поддерживается в XPath 1.0, который используется в DevTools браузера.
Использовать XPath 1.0-совместимое выражение с substring()
`//label[substring(text(), string-length(text()) - string-length('User Email') + 1) = 'User Email']`

`//svg[@iconid=’editon’]`
invalid
Использованы неправильные типографские кавычки ’ ’. В XPath нужны обычные одинарные кавычки ' '.
`//svg[@iconid='editon']`

## Part 9. Playwright

1. User Email

<pre><code>
const userEmail = page.locator('#userId');

const userEmailCount = await userEmail.count();
console.log(userEmailCount);

await userEmail.fill('test@example.com');
</code></pre>

Result: count() = 1

2. Password

<pre><code>
const password = page.locator(
  "//input[@name='Password' and @type='password']"
);

const passwordCount = await password.count();
console.log(passwordCount);

await password.fill('Test123!');
</code></pre>

Result: count() = 1

3. Submit

<pre><code>
const submitButton = page.locator('button[value="Submit"]');

const submitButtonCount = await submitButton.count();
console.log(submitButtonCount);

await submitButton.click();
</code></pre>

Result: count() = 1

4. John Smith row

<pre><code>
const johnSmithRow = page.locator(
  "//tr[.//td[normalize-space(.)='John Smith']]"
);

const johnSmithRowCount = await johnSmithRow.count();
console.log(johnSmithRowCount);

await expect(johnSmithRow).toContainText('John Smith');
</code></pre>

Result: count() = 1

5. John Smith Status

<pre><code>
const johnSmithStatus = page.locator(
  "//tr[.//td[normalize-space(.)='John Smith']]/td[5]"
);

const johnSmithStatusCount = await johnSmithStatus.count();
console.log(johnSmithStatusCount);

await expect(johnSmithStatus).toHaveText('Enabled');
</code></pre>

Result: count() = 1
