<?php

use App\Modules\Enquiry\Models\Enquiry;

it('restricts the queries page to admins', function () {
    $enquiry = Enquiry::factory()->create();

    $this->getJson('/api/admin/enquiries')->assertUnauthorized();
    $this->actingAs(customer())->getJson('/api/admin/enquiries')->assertForbidden();
    $this->actingAs(customer())->patchJson("/api/admin/enquiries/{$enquiry->id}", ['status' => 'read'])->assertForbidden();
});

it('lists enquiries newest first with an unread count', function () {
    $old = Enquiry::factory()->create(['enquired_at' => now()->subDay()]);
    $new = Enquiry::factory()->create(['enquired_at' => now()]);
    Enquiry::factory()->create(['status' => 'read', 'enquired_at' => now()->subWeek()]);

    $this->actingAs(admin())->getJson('/api/admin/enquiries')
        ->assertOk()
        ->assertJsonPath('data.0.id', $new->id)
        ->assertJsonPath('data.1.id', $old->id)
        ->assertJsonPath('meta.unreadCount', 2)
        ->assertJsonStructure(['data' => [['id', 'product' => ['id', 'title'], 'firstName', 'lastName', 'email', 'countryCode', 'phone', 'query', 'status', 'enquiredAt']], 'links', 'meta']);
});

it('filters by status', function () {
    Enquiry::factory()->count(2)->create();
    Enquiry::factory()->create(['status' => 'read']);

    $this->actingAs(admin())->getJson('/api/admin/enquiries?status=new')->assertOk()->assertJsonCount(2, 'data');
    $this->actingAs(admin())->getJson('/api/admin/enquiries?status=bogus')->assertUnprocessable();
});

it('marks an enquiry as read', function () {
    $enquiry = Enquiry::factory()->create();

    $this->actingAs(admin())
        ->patchJson("/api/admin/enquiries/{$enquiry->id}", ['status' => 'read'])
        ->assertOk()
        ->assertJsonPath('data.status', 'read');

    expect($enquiry->fresh()->status->value)->toBe('read');
});

it('validates status updates and 404s on unknown enquiries', function () {
    $enquiry = Enquiry::factory()->create();

    $this->actingAs(admin())->patchJson("/api/admin/enquiries/{$enquiry->id}", ['status' => 'archived'])->assertUnprocessable();
    $this->actingAs(admin())->patchJson('/api/admin/enquiries/999999', ['status' => 'read'])->assertNotFound();
});
