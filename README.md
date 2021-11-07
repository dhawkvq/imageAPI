# Image API

<br>

## Prerequisites

---

**Node v16.x**

```
If you are using Volta for Node version management then you are set to go 🤘
```

<br>

## Get started

---

Install the dependencies...

```bash
yarn
```

Set and place server url in .env file to whichever port you prefer...

```bash
echo "SERVER_URL=< your preferred port >" > .env

EXAMPLE: echo "SERVER_URL=4000" > .env
```

Start the ImageApi server...

```bash
yarn start
```

<br>

## Scripts

---

<br>

Start the server in watch mode...

```bash
yarn start
```

Run Jasmine Tests...

```
yarn test
```

Compile TS Server to JS ...

> _will create and place code in dist directory_

```
yarn build
```

Run Prettier Check...

```
yarn prettier
```

Run Lint Check...

```
yarn lint
```

<br>

## API

---

<br>

## Resize Existing Server Image

Resize an existing jpeg image to the specified height, width, and options you provide

```
POST /api/resize/:fileName
```

| Attribute      | Type   | Required                     | Description                                                    |
| :------------- | :----- | :--------------------------- | :------------------------------------------------------------- |
| **_fileName_** | string | Yes                          | One of the existing files you can choose to resize             |
| **_height_**   | number | No\*(if width is provided )  | height you want image to resize to(**_sent in request body_**) |
| **_width_**    | number | No\*(if height is provided ) | width you want image to resize to(**_sent in request body_**)  |
| **_options_**  | Object | No                           | Options args listed below Resize Local Image                   |

Current images located on server you can resize:

```
backflip.jpeg
gnar.jpeg
pow.jpeg
```

<br>

<br>

## Resize Local Image

Resize a local jpeg image to the specified height, width, and options you provide

```
POST /api/resize
```

| Attribute     | Type   | Required                     | Description                        |
| :------------ | :----- | :--------------------------- | :--------------------------------- |
| **_height_**  | number | No\*(if width is provided )  | height you want image to resize to |
| **_width_**   | number | No\*(if height is provided ) | width you want image to resize to  |
| **_options_** | Object | No                           | Options args listed below          |

<br>

### Options

```
/** Alternative means of specifying width. If both are present this take priority. */

width: number | undefined;

/** Alternative means of specifying height. If both are present this take priority. */

height: number | undefined;

/** How the image should be resized to fit both provided dimensions, one of cover, contain, fill, inside or outside. (optional, default 'cover') */

fit: keyof FitEnum | undefined;

    FitEnum:
    |'contain'
    |'cover'
    |'fill'
    |'inside'
    |'outside'

/** Position, gravity or strategy to use when fit is cover or contain. (optional, default 'centre') */

position: number | string | undefined;

/** Background colour when using a fit of contain, parsed by the color module, defaults to black without transparency. (optional, default {r:0,g:0,b:0,alpha:1}) */

background: Color | undefined;

   Color = string | RGBA;

   RGBA {
        r: number | undefined;
        g: number | undefined;
        b: number | undefined;
        alpha: number | undefined;
    }


/** The kernel to use for image reduction. (optional, default 'lanczos3') */

kernel: keyof KernelEnum | undefined;

    KernelEnum:
      |'nearest'
      |'cubic'
      |'mitchell'
      |'lanczos2'
      |'lanczos3'


/** Do not enlarge if the width or height are already less than the specified dimensions, equivalent to GraphicsMagick's > geometry option. (optional, default false) */

withoutEnlargement: boolean | undefined;

/** Take greater advantage of the JPEG and WebP shrink-on-load feature, which can lead to a slight moiré pattern on some images. (optional, default true) */

fastShrinkOnLoad: boolean | undefined;

```

<br>

## Retrieve all pictures

Will return an array of picture names that were resized. (You can use these to send a GET request to download a particular picture)

```
GET /pictures
```

### Returns

```
Example:

[
  'pictureOne200x200-asnk2367.jpeg',
  'pictureTwo300x300-bs9k2361.jpeg',
  'pictureThree600x900-sdfinds9.jpeg',
]
```

<br>

## Download Image

Retrieve a particular image that was resized by the server

```
GET /download/:fileName
```

| Attribute      | Type   | Required | Description                          |
| :------------- | :----- | :------- | :----------------------------------- |
| **_fileName_** | string | Yes      | file name you would like to download |
