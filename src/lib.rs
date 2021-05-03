mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Alive = 1,
    Dead = 0,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
    initial_state: Vec<Cell>,
}

impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        }
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn new(width: Option<u32>, height: Option<u32>) -> Self {
        let width = width.unwrap_or(64);
        let height = height.unwrap_or(64);

        let cells: Vec<Cell> = (0..width * height).map(|_| Cell::Dead).collect();

        Self {
            width,
            height,
            cells: cells.clone(),
            initial_state: cells,
        }
    }

    pub fn random(&mut self) {
        self.cells = (0..self.width * self.height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();
        self.initial_state = self.cells.clone();
    }

    pub fn tick(&mut self) {
        let mut next_state = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let number_of_neighbors = self.count_number_of_neighbors(row, col);

                let next = match (self.cells[idx], number_of_neighbors) {
                    (Cell::Alive, x) if x < 2 => Cell::Dead,
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    (Cell::Alive, x) if x > 3 => Cell::Dead,
                    (Cell::Dead, 3) => Cell::Alive,
                    (otherwise, _) => otherwise,
                };
                next_state[idx] = next;
            }
        }
        self.cells = next_state;
    }

    pub fn empty(&mut self) {
        self.cells = (0..self.width * self.height).map(|_| Cell::Dead).collect();
        self.initial_state = self.cells.clone();
    }

    pub fn reset(&mut self) {
        self.cells = self.initial_state.clone();
    }

    pub fn get_width(&self) -> u32 {
        self.width
    }
    pub fn set_width(&mut self, width: u32) {
        self.width = width;
    }
    pub fn get_height(&self) -> u32 {
        self.height
    }
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
    }
    pub fn get_initial_state(&self) -> *const Cell {
        self.initial_state.as_ptr()
    }
    pub fn get_cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }
    pub fn set_cell(&mut self, cell: Cell, row: u32, col: u32) {
        let idx = self.get_index(row, col);
        self.cells[idx] = cell;
        self.initial_state[idx] = cell;
    }
    pub fn toggle_cell(&mut self, row: u32, col: u32) {
        let idx = self.get_index(row, col);
        self.cells[idx].toggle();
        self.initial_state[idx] = self.cells[idx];
    }
}

impl Universe {
    fn get_index(&self, row: u32, col: u32) -> usize {
        (row * self.width + col) as usize
    }

    fn count_number_of_neighbors(&self, row: u32, col: u32) -> u8 {
        let mut count = 0;

        let north = if row == 0 { self.height - 1 } else { row - 1 };
        let east = if col == self.width - 1 { 0 } else { col + 1 };
        let south = if row == self.height - 1 { 0 } else { row + 1 };
        let west = if col == 0 { self.width - 1 } else { col - 1 };

        let nw = self.get_index(north, west);
        count += self.cells[nw] as u8;
        let n = self.get_index(north, col);
        count += self.cells[n] as u8;
        let ne = self.get_index(north, east);
        count += self.cells[ne] as u8;
        let w = self.get_index(row, west);
        count += self.cells[w] as u8;
        let e = self.get_index(row, east);
        count += self.cells[e] as u8;
        let sw = self.get_index(south, west);
        count += self.cells[sw] as u8;
        let s = self.get_index(south, col);
        count += self.cells[s] as u8;
        let se = self.get_index(south, east);
        count += self.cells[se] as u8;

        count
    }
}
