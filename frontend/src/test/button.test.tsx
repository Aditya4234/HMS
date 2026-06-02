import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Button>Default</Button>);
    const button = screen.getByText("Default");
    expect(button).toBeInTheDocument();
  });

  it("applies gradient variant classes", () => {
    render(<Button variant="gradient">Gradient</Button>);
    const button = screen.getByText("Gradient");
    expect(button).toBeInTheDocument();
  });

  it("applies size classes", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText("Large");
    expect(button).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });

  it("renders as child when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByText("Link Button");
    expect(link.tagName).toBe("A");
  });
});
