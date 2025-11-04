import { chromium } from 'playwright';

// --- CONSTANTES DE SELECTORES ---
const URL = "https://www.sbs.gob.pe/app/pp/EstadisticasSAEEPortal/Paginas/TIActivaTipoCreditoEmpresa.aspx?tip=B";
const TAB_DOLARES = "a#ctl00_cphContent_lbtnMex";
const BASE_ID = "ctl00_cphContent_rpgActual";
const HEADER_SELECTOR_TPL = "table#{base_id}{suffix}_ctl00_DataZone_DT > thead > tr > th";
const DATA_ROWS_SELECTOR_TPL = "table#{base_id}{suffix}_ctl00_DataZone_DT > tbody > tr";
const LABEL_ROWS_SELECTOR_TPL = "table#{base_id}{suffix}_OT > tbody > tr td.rpgRowHeaderField";
const MAIN_TABLE_SELECTOR_TPL = "table#{base_id}{suffix}_OT";

// Exportamos la función principal
export const getSbsRates = async (moneda = 'nacional') => {
  
  const suffix = moneda === 'extranjera' ? 'Mex' : 'Mn';
  
  const HEADER_SELECTOR = HEADER_SELECTOR_TPL.replace('{base_id}', BASE_ID).replace('{suffix}', suffix);
  const DATA_ROWS_SELECTOR = DATA_ROWS_SELECTOR_TPL.replace('{base_id}', BASE_ID).replace('{suffix}', suffix);
  const LABEL_ROWS_SELECTOR = LABEL_ROWS_SELECTOR_TPL.replace('{base_id}', BASE_ID).replace('{suffix}', suffix);
  const MAIN_TABLE_SELECTOR = MAIN_TABLE_SELECTOR_TPL.replace('{base_id}', BASE_ID).replace('{suffix}', suffix);

  console.log(`--- Iniciando Scraper Service para Moneda: ${moneda} ---`);
  
  let browser = null;
  let finalJson = [];

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    });
    const page = await context.newPage();

    console.log(`1. Navegando a ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle' });

    if (moneda === 'extranjera') {
      console.log("2. Aplicando filtro: Moneda Extranjera...");
      await page.click(TAB_DOLARES);
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      console.log("   ...tabla recargada.");
    } else {
      console.log("2. Usando filtro por defecto: Moneda Nacional.");
    }

    console.log(`2b. Esperando selector: ${MAIN_TABLE_SELECTOR}`);
    await page.waitForSelector(MAIN_TABLE_SELECTOR, { timeout: 15000 });
    console.log("   ...¡Selector de tabla encontrado!");

    console.log("3. Extrayendo datos...");
    
    // Lectura A: Bancos
    const headerElements = await page.$$(HEADER_SELECTOR);
    const bank_headers = await Promise.all(headerElements.map(async (el) => {
        const text = (await el.textContent()).trim();
        return text === 'Promedio' ? 'promedio' : text;
    }));
    console.log(`   - Encontrados ${bank_headers.length} bancos/columnas.`);

    // Lectura B: Filas de Números
    const dataRowElements = await page.$$(DATA_ROWS_SELECTOR);
    const all_data_rows = [];
    for (const row of dataRowElements) {
        const cells = await row.$$('td.rpgDataCell');
        const cell_values = await Promise.all(cells.map(async (c) => 
            (await c.textContent()).trim().replace('s.i.', '-')
        ));
        all_data_rows.push(cell_values);
    }
    console.log(`   - Encontradas ${all_data_rows.length} filas de datos numéricos.`);

    // Lectura C: Filas de Etiquetas
    const labelElements = await page.$$(LABEL_ROWS_SELECTOR);
    console.log(`   - Encontradas ${labelElements.length} filas de etiquetas.`);

    console.log("4. Procesando y uniendo datos en formato JSON...");
    
    let current_group_obj = null;
    let data_row_index = 0;

    for (const label of labelElements) {
        const group_tag = await label.$('b');
        if (group_tag) {
            const group_name = (await group_tag.textContent()).trim();
            current_group_obj = { group: group_name, category: [] };
            finalJson.push(current_group_obj);
        } else {
            const category_name = (await label.textContent()).trim();
            if (!current_group_obj) continue;

            if (data_row_index < all_data_rows.length) {
                const numbers = all_data_rows[data_row_index];
                const category_obj = { name: category_name };
                bank_headers.forEach((header, i) => {
                    category_obj[header] = numbers[i] || '-';
                });
                current_group_obj.category.push(category_obj);
                data_row_index++;
            }
        }
    }
    
    console.log("--- Proceso de Service completado ---");
    return finalJson;

  } catch (error) {
    console.error("Error en el scraper service:", error);
    throw new Error(error.message); // Propagamos el error al controlador
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser cerrado.");
    }
  }
};