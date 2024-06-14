# RUN HeartBeat FrontEnd

## 1. How to start

```
cd HearBeat/frontend
pnpm install
pnpm start

cd HearBeat/backend
./gradlew bootRun

```

## 2. How to run unit test and view test coverage

```
cd HearBeat/frontend
pnpm coverage


cd HearBeat/frontend/coverage/lcov-report/index.html
open index.html
```

## 3. How to run e2e test

1. Start the backend service

```
cd HearBeat/backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

2. Start the frontend service

```
cd HearBeat/frontend
pnpm start
```

3. Run the e2e tests

```
cd HearBeat/frontend
pnpm e2e:local
```

## 4. Code development specification

1. Style naming starts with 'Styled' and distinguishes it from the parent component

```
export const StyledTypography = styled(Typography)({
  fontSize: '1rem',
})
```

2. Css units should use rem:

```
export const StyledTypography = styled('div')({
  width: '10rem',
})
```

3. Write e2e tests using POM design pattern

```
page.cy.ts:
  get headerVersion() {
    return cy.get('span[title="Heartbeat"]').parent().next()
  }


test.cy.ts:
  homePage.headerVersion.should('exist')


```

## Page Responsibility

We need consider responsibility in our page. We consider three main breakpoints in out system, 390, 1280 and 1920. For the screen size,
- if < 390, the page size will keep 390 and scrolls horizontally;
- if >= 390 and < 1280, it shows mobile view and the content size will change to fit viewport; 
- if >= 1280 and <= 1920, it shows desktop view, the content size is 70% of the viewport but has a minimum size 1240 and a maximum size 1344.
- if > 1920, the content size will no longer change with the screen size, that means it will keep the same size with it in 1920. But the page header will still change to fit viewport.

the breakpoints are set in `theme.js` file.

```
  breakpoints: {
    values: {
      xs: 0,
      sm: 390,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
    keys: ['xs', 'sm', 'md', 'lg', 'xl'],
  },
```

how we use it:

```
  [theme.breakpoints.down('lg')]: {
    order: 2,
    margin: '1.25rem 0 0',
  },
```

you can search material ui responsibility to find more information.
