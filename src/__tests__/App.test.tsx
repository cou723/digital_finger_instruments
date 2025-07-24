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
			screen.getByText("Jキーを押しながら音階キーを押して演奏しましょう"),
		).toBeInTheDocument();
	});

	it("キーボードコンポーネントが表示される", () => {
		render(<App />);
		expect(screen.getByText("キーボード")).toBeInTheDocument();
	});

	it("すべてのキーが表示される", () => {
		render(<App />);
		const keys = ["A", "S", "D", "F", "Z", "X", "C", "V"];
		keys.forEach((key) => {
			expect(screen.getByText(key)).toBeInTheDocument();
		});
	});

	it("日本語の音階名が表示される", () => {
		render(<App />);
		const noteNames = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];
		noteNames.forEach((noteName) => {
			// ドは2回表示されるので、最初の一つを確認
			const elements = screen.getAllByText(noteName);
			expect(elements.length).toBeGreaterThanOrEqual(1);
		});
	});
});
