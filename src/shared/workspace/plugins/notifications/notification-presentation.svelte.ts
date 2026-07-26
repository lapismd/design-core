export class NotificationPresentationState {
  centerOpen = $state(false);

  open(): void {
    this.centerOpen = true;
  }

  close(): void {
    this.centerOpen = false;
  }

  toggle(): void {
    this.centerOpen = !this.centerOpen;
  }
}
