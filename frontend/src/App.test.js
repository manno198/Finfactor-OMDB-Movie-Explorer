import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import axios from "axios";

jest.mock("axios");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

beforeAll(() => {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver;
  }
});

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  process.env.REACT_APP_BACKEND_URL = "http://localhost:8001";
});

test("renders search input and updates favorites count from local storage", async () => {
  localStorage.setItem(
    "cineexplorer_favorites",
    JSON.stringify([
      {
        imdbID: "tt001",
        title: "Stored Favorite",
        year: "2024",
        poster: "N/A",
        type: "movie",
      },
    ])
  );

  render(<App />);

  expect(screen.getByTestId("search-input")).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByText(/Favorites \(1\)/)).toBeInTheDocument()
  );
});

test("adds a searched movie to favorites via local storage", async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/movies/search")) {
      return Promise.resolve({
        data: {
          Response: "True",
          Search: [
            {
              Title: "Inception",
              Year: "2010",
              imdbID: "tt1375666",
              Type: "movie",
              Poster: "N/A",
            },
          ],
          totalResults: "1",
        },
      });
    }

    return Promise.resolve({
      data: { Response: "True", Title: "Inception", imdbID: "tt1375666" },
    });
  });

  render(<App />);

  fireEvent.change(screen.getByTestId("search-input"), {
    target: { value: "Inception" },
  });
  fireEvent.click(screen.getByTestId("search-button"));

  await screen.findByTestId("movie-card-tt1375666");
  fireEvent.click(screen.getByTestId("favorite-btn-tt1375666"));

  await waitFor(() => {
    const stored = JSON.parse(localStorage.getItem("cineexplorer_favorites"));
    expect(stored).toHaveLength(1);
    expect(stored[0].imdbID).toBe("tt1375666");
  });

  expect(screen.getByText(/Favorites \(1\)/)).toBeInTheDocument();
});

