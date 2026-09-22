import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('project navigation, full-size images, and accessibility',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Objects. With intention.'})).toBeVisible();
 await page.getByRole('tab',{name:/02 E-REV3/}).click();
 await expect(page.locator('#project-name')).toHaveText('E-REV3');
 await page.getByRole('tab',{name:/02 E-REV3/}).press('ArrowRight');
 await expect(page.locator('#project-name')).toHaveText('Haven');
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 expect(audit.violations).toEqual([]);
 await page.getByRole('link',{name:'Enlarge: The design in its outdoor context'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('3D assembly or usable fallback',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Explore in 3D/}).click();
 await expect(page.locator('#viewer-controls').or(page.locator('#load-state').filter({hasText:'3D is unavailable'}))).toBeVisible();
 if(await page.locator('#viewer-controls').isVisible()){
  await page.getByRole('button',{name:'Explode',exact:true}).click();
  await expect(page.locator('#separation')).toHaveValue('100');
  await page.locator('.part-list button').first().click();
  await expect(page.getByRole('button',{name:'Isolate part'})).toBeEnabled();
  await page.getByRole('button',{name:'Isolate part'}).click();
  await page.getByRole('button',{name:'Reset view'}).click();
  await expect(page.locator('#separation')).toHaveValue('0');
 }
});
