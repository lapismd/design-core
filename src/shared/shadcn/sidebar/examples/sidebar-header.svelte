<Sidebar.Root>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Sidebar.MenuButton {...props}>
                Select Workspace
                <ChevronDown class="ms-auto" />
              </Sidebar.MenuButton>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)">
            <DropdownMenu.Item>
              <span>Acme Inc</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <span>Acme Corp.</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
</Sidebar.Root>
