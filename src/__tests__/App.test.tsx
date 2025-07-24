import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
	it("アプリケーションのタイトルが表示される", () => {
		render(<App />);
		expect(screen.getByText("デジタル楽器")).toBeInTheDocument();
	});

	it("説明テキストが表示される", () => {
		render(<App />);
		expect(
			screen.getByText("キーボードを押して音を奏でましょう"),
		).toBeInTheDocument();
	});

	it("キーボードコンポーネントが表示される", () => {
		render(<App />);
		expect(screen.getByText("キーボード")).toBeInTheDocument();
	});

	it("すべてのキーが表示される", () => {
		render(<App />);
		const keys = ["A", "S", "D", "F", "G", "H", "J"];
		keys.forEach((key) => {
			expect(screen.getByText(key)).toBeInTheDocument();
		});
	});

	it("日本語の音階名が表示される", () => {
		render(<App />);
		const noteNames = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];
		noteNames.forEach((noteName) => {
			expect(screen.getByText(noteName)).toBeInTheDocument();
		});
	});
});
