//! Provides methods for generating universe based on [Conway's game of life][life].
//!
//! [life]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[allow(unused_macros)]
macro_rules! nth {
    ($universe:expr, $idx:expr) => {
        unsafe { *$universe.get_cells().offset($idx) }
    };
    ($universe:expr, $row:expr, $col:expr) => {
        unsafe {
            *$universe
                .get_cells()
                .offset($universe.get_index($row, $col) as isize)
        }
    };
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

/// `Cell` represents whether specific "square" of the universe is `Dead` or
/// `Alive`.
#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Alive = 1,
    Dead = 0,
}

/// `Universe` is a vector of [`Cell`]s, which also saves initial state of them.
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
    /// Creates universe with given optional width and height.
    ///
    /// Creates initial `width * height` (unwrapped) sized universe filled with `Dead` [`Cell`]s.
    /// If `None` is passed as width and/or height, defaults to 64 for both of them.
    ///
    /// * `width` - width of universe.
    /// * `height` - height of universe.
    ///
    /// # Example
    ///
    /// ```
    /// # fn main() {
    /// use game_of_life::Universe;
    ///
    /// let universe = Universe::new(None, Some(128));
    /// assert_eq!(universe.get_width(), 64);
    /// assert_eq!(universe.get_height(), 128);
    /// # }
    /// ```
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

    /// Generates "random" universe.
    ///
    /// Fills universe with random `Alive`/`Dead` [`Cell`]s and clones the result
    /// to `initial_state` as well.
    ///
    /// # Example
    ///
    /// ```
    /// # fn main() {
    /// use game_of_life::Universe;
    ///
    /// let mut universe = Universe::new(None, None);
    /// universe.random();
    /// # }
    /// ```
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

    /// Calculates next state of universe based on the rules of [Conway's game of life][life].
    ///
    /// # Example
    ///
    /// ```
    /// # fn main() {
    /// use game_of_life::Universe;
    ///
    /// let mut universe = Universe::new(None, None);
    /// universe.tick();
    /// # }
    /// ```
    ///
    /// [life]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
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

    /// Sets the universe `cells` and `initial_state` to `Dead` [`Cell`]s.
    ///
    /// # Example
    ///
    /// ```
    /// # fn main() {
    /// use game_of_life::Universe;
    ///
    /// let mut universe = Universe::new(None, None);
    /// universe.empty();
    /// # }
    /// ```
    pub fn empty(&mut self) {
        self.cells = (0..self.width * self.height).map(|_| Cell::Dead).collect();
        self.initial_state = self.cells.clone();
        let _cells = Universe::new(None, None).get_cells();
    }

    /// Sets universe `cells` to `initial_state`.
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

    /// Set [`Cell`] state to `cell` on specific index.
    ///
    /// * `cell` - `Cell`.
    /// * `row` - "matrix" row.
    /// * `col` - "matrix" column.
    ///
    /// # Example
    ///
    /// ```
    /// # fn main() {
    /// use game_of_life::{Universe, Cell};
    ///
    /// let mut universe = Universe::new(None, None);
    /// let cell = Cell::Alive;
    /// let row = 1;
    /// let col = 1;
    /// universe.set_cell(cell, row, col);
    ///
    /// assert_eq!(unsafe{*universe.get_cells().offset(65)}, Cell::Alive);
    /// # }
    /// ```
    pub fn set_cell(&mut self, cell: Cell, row: u32, col: u32) {
        let idx = self.get_index(row, col);
        self.cells[idx] = cell;
        self.initial_state[idx] = cell;
    }

    /// Toggle [`Cell`] state on specific index.
    ///
    /// * `row` - "matrix" row.
    /// * `col` - "matrix" column.
    ///
    /// # Example
    ///
    /// ```
    /// # fn main() {
    /// use game_of_life::{Universe, Cell};
    ///
    /// let mut universe = Universe::new(None, None);
    /// let row = 1;
    /// let col = 1;
    /// universe.toggle_cell(row, col);
    ///
    /// assert_eq!(unsafe{*universe.get_cells().offset(65)}, Cell::Alive);
    /// # }
    /// ```
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

#[test]
fn cell_toggle_test() {
    let mut cell = Cell::Dead;
    cell.toggle();
    assert_eq!(Cell::Alive, cell);
    cell.toggle();
    assert_eq!(Cell::Dead, cell);
}

#[test]
fn universe_state_test() {
    let mut universe = Universe::new(Some(32), Some(32));
    let width = universe.get_width();
    let height = universe.get_height();

    // cells and initial_state are filled with dead cells
    for i in 0..(width * height) as isize {
        assert_eq!(
            unsafe { *universe.get_initial_state().offset(i) },
            nth!(&universe, i)
        )
    }

    // changing cells also changes initial_state
    universe.toggle_cell(1, 1);
    assert_eq!(nth!(&universe, universe.get_index(1, 1) as isize), unsafe {
        *universe
            .get_initial_state()
            .offset(universe.get_index(1, 1) as isize)
    })
}

#[test]
fn universe_cell_neighbors_test() {
    let mut universe = Universe::new(Some(32), Some(32));

    assert_eq!(universe.count_number_of_neighbors(1, 1), 0);

    universe.set_cell(Cell::Alive, 0, 1);
    assert_eq!(universe.count_number_of_neighbors(1, 1), 1);

    universe.set_cell(Cell::Alive, 2, 1);
    universe.set_cell(Cell::Alive, 2, 2);
    assert_eq!(universe.count_number_of_neighbors(1, 1), 3);

    universe.set_cell(Cell::Alive, 20, 20);
    assert_eq!(universe.count_number_of_neighbors(1, 1), 3);

    universe.set_cell(Cell::Dead, 0, 1);
    assert_eq!(universe.count_number_of_neighbors(1, 1), 2);
}
