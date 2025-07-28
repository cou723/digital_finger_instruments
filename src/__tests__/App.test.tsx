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
			screen.getByText(
				"発声キー（J,K,L）を押しながら音階キー（A,S,D,F + スペース）を押して演奏しましょう",
			),
		).toBeInTheDocument();
	});

	it("キーボードコンポーネントが表示される", () => {
		render(<App />);
		expect(screen.getByText("キーボード")).toBeInTheDocument();
	});

	it("二進数キーが表示される", () => {
		render(<App />);
		const binaryKeys = ["A", "S", "D", "F"];
		binaryKeys.forEach((key) => {
			expect(screen.getByText(key)).toBeInTheDocument();
		});
	});

	it("周波数ベース音階システムが正煎動作する", () => {
		render(<App />);

		// 基準音設定セクションの確認
		expect(screen.getByText("0000時の基準音設定")).toBeInTheDocument();

		// 音階一覧のタイトル確認（基準音C2）
		expect(screen.getByText(/C2基準 - 2オクターブ分/)).toBeInTheDocument();

		// 音階表示の確認（C2から開始）
		expect(screen.getByText("C2")).toBeInTheDocument();

		// 日本語音階名の確認（複数存在する場合があるのでgetAllByTextを使用）
		expect(screen.getAllByText("ド").length).toBeGreaterThan(0);

		// 周波数表示の確認
		expect(screen.getByText("65.41Hz")).toBeInTheDocument(); // C2の周波数
	});

	it("基準音選択機能が表示される", () => {
		render(<App />);

		// 基準音選択のラベル
		expect(
			screen.getByText(
				"二進数キーを何も押さない（0000）時に鳴る基準音を選択してください：",
			),
		).toBeInTheDocument();

		// 現在の設定表示
		expect(screen.getByText(/現在の設定: ド \(C2\)/)).toBeInTheDocument();

		// 説明テキスト
		expect(
			screen.getByText(
				"※ 基準音を変更すると、0-15の全ての音階が相対的にシフトされます",
			),
		).toBeInTheDocument();
	});

	it("発音制御の説明が表示される", () => {
		render(<App />);

		expect(screen.getByText("J キー：発音制御")).toBeInTheDocument();
		expect(
			screen.getByText(/Jキーを押している間のみ音が鳴ります/),
		).toBeInTheDocument();
		expect(
			screen.getByText(/Jキー \+ A,S,D,Fキーの組み合わせで音階を決定します/),
		).toBeInTheDocument();
	});
});
