import { render, screen } from "@testing-library/react";
import FileUpload from "@/app/components/common/FileUpload";

describe("FileUpload Component", () => {
  it("renders upload button", () => {
    render(
      <FileUpload
        endpoint="/api/upload"
        fileType="profile"
        onUpload={jest.fn()}
      />
    );

    const button = screen.getByText(/click to upload/i);
    expect(button).toBeInTheDocument();
  });

  it("shows upload text", () => {
    render(
      <FileUpload
        endpoint="/api/upload"
        fileType="profile"
        onUpload={jest.fn()}
      />
    );

    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  it("renders without errors", () => {
    const { container } = render(
      <FileUpload
        endpoint="/api/upload"
        fileType="profile"
        onUpload={jest.fn()}
      />
    );

    expect(container).toBeTruthy();
  });
});
